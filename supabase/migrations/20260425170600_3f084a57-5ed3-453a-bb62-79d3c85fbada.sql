-- Wave 3: Capacity per time slot (global per unit) + confirmation function helper

-- 1. Add capacity column to units (default 40, nullable means unlimited)
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS capacidade_por_horario INTEGER;

COMMENT ON COLUMN public.units.capacidade_por_horario IS 'Maximum number of guests that can be reserved per time slot for this unit. NULL = unlimited.';

-- 2. Helper function to count reserved seats for a given unit/date/time
CREATE OR REPLACE FUNCTION public.count_reserved_seats(
  _unit_id UUID,
  _data DATE,
  _horario TEXT
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(pessoas), 0)::INTEGER
  FROM public.reservations
  WHERE 
    (_unit_id IS NULL OR unit_id = _unit_id)
    AND data = _data
    AND horario = _horario
    AND status IN ('pendente', 'confirmada');
$$;

-- 3. Trigger to enforce capacity on insert/update
CREATE OR REPLACE FUNCTION public.enforce_reservation_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cap INTEGER;
  reserved INTEGER;
BEGIN
  -- Skip enforcement if cancelled
  IF NEW.status = 'cancelada' THEN
    RETURN NEW;
  END IF;

  -- Get capacity for the chosen unit (or principal unit if NULL)
  SELECT capacidade_por_horario INTO cap
  FROM public.units
  WHERE id = COALESCE(NEW.unit_id, (SELECT id FROM public.units WHERE principal = true AND ativo = true LIMIT 1));

  -- NULL capacity = unlimited
  IF cap IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count current reservations excluding this row (in case of update)
  SELECT COALESCE(SUM(pessoas), 0)::INTEGER INTO reserved
  FROM public.reservations
  WHERE 
    COALESCE(unit_id, (SELECT id FROM public.units WHERE principal = true AND ativo = true LIMIT 1)) 
      = COALESCE(NEW.unit_id, (SELECT id FROM public.units WHERE principal = true AND ativo = true LIMIT 1))
    AND data = NEW.data
    AND horario = NEW.horario
    AND status IN ('pendente', 'confirmada')
    AND id <> NEW.id;

  IF (reserved + NEW.pessoas) > cap THEN
    RAISE EXCEPTION 'Horário sem disponibilidade: capacidade de % pessoas para este horário foi atingida (% já reservadas, % solicitadas).', cap, reserved, NEW.pessoas
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_reservation_capacity ON public.reservations;
CREATE TRIGGER trg_enforce_reservation_capacity
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_reservation_capacity();

-- 4. Index to speed up capacity lookups
CREATE INDEX IF NOT EXISTS idx_reservations_unit_data_horario 
  ON public.reservations (unit_id, data, horario) 
  WHERE status IN ('pendente', 'confirmada');

-- 5. Set a sensible default for existing units (40 seats per slot)
UPDATE public.units SET capacidade_por_horario = 40 WHERE capacidade_por_horario IS NULL AND ativo = true;