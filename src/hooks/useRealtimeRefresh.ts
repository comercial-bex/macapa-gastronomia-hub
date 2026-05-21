import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to Postgres changes on the given tables and calls `onChange`
 * whenever any insert/update/delete arrives. Used to keep admin lists and
 * the public site in sync without manual refresh.
 */
export const useRealtimeRefresh = (tables: string[], onChange: () => void) => {
  useEffect(() => {
    const channel = supabase.channel(`realtime-${tables.join("-")}-${Math.random().toString(36).slice(2)}`);
    tables.forEach((table) => {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        () => onChange(),
      );
    });
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(",")]);
};