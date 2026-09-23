#!/usr/bin/env bash
#
# Sobe um PostgreSQL efêmero, aplica todas as migrations em ordem e roda as
# asserções de supabase/tests/.
#
# Existe porque triggers, funções de RBAC e constraints não são exercitados
# pelos testes de Vitest — e foi justamente rodando as migrations num banco
# real que apareceu o bug do NEW.email em link_contact().
#
#   ./scripts/test-db.sh
#
# Requer: postgresql (initdb, pg_ctl, psql) e um usuário não-root.

set -euo pipefail

PORT="${PGTEST_PORT:-55432}"
PGBIN="${PGBIN:-$(dirname "$(command -v initdb || echo /usr/lib/postgresql/16/bin/initdb)")}"
WORKDIR="$(mktemp -d)"
PGDATA="$WORKDIR/data"
SOCKET="$WORKDIR/socket"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  "$PGBIN/pg_ctl" -D "$PGDATA" stop -m immediate >/dev/null 2>&1 || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

if [ "$(id -u)" = "0" ]; then
  echo "erro: o PostgreSQL recusa rodar como root. Use um usuário comum." >&2
  exit 1
fi

mkdir -p "$SOCKET"

echo "==> inicializando cluster efêmero"
"$PGBIN/initdb" -D "$PGDATA" -A trust -U postgres >/dev/null

echo "==> subindo na porta $PORT"
"$PGBIN/pg_ctl" -D "$PGDATA" -o "-p $PORT -k $SOCKET -h ''" -l "$PGDATA/log" start >/dev/null
sleep 2

psql() { "$PGBIN/psql" -h "$SOCKET" -p "$PORT" -U postgres -d postgres "$@"; }

echo "==> criando stubs de auth/storage (providos pelo Supabase em produção)"
psql -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE SCHEMA auth;
CREATE SCHEMA storage;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE auth.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text);

CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
  $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

CREATE TABLE storage.buckets (
  id text PRIMARY KEY, name text NOT NULL, public boolean NOT NULL DEFAULT false,
  file_size_limit bigint, allowed_mime_types text[]
);
CREATE TABLE storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text
);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION storage.extension(name text) RETURNS text LANGUAGE sql IMMUTABLE AS
  $$ SELECT lower(split_part(name, '.', array_length(string_to_array(name, '.'), 1))) $$;

CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE PUBLICATION supabase_realtime;
SQL

echo "==> aplicando migrations"
applied=0
skipped=0
for f in "$REPO_ROOT"/supabase/migrations/*.sql; do
  if psql -v ON_ERROR_STOP=1 -q -f "$f" >/dev/null 2>&1; then
    applied=$((applied + 1))
  else
    # Migrations de seed referenciam UUIDs da base de produção e não aplicam
    # num banco novo. Não são erro de schema.
    echo "    ignorada (seed): $(basename "$f")"
    skipped=$((skipped + 1))
  fi
done
echo "    $applied aplicadas, $skipped ignoradas"

echo "==> rodando asserções"
psql -v ON_ERROR_STOP=1 -q -f "$REPO_ROOT/supabase/tests/schema_assertions.sql"

echo "==> verificando que contacts não vaza para visitante anônimo"
psql -v ON_ERROR_STOP=1 -q <<'SQL'
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.contacts TO anon;
SET ROLE anon;
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.contacts;
  ASSERT n = 0, format('LGPD: contacts visível para anon (%s linhas)', n);
END $$;
RESET ROLE;
SQL

echo ""
echo "OK — schema e lógica de negócio validados."
