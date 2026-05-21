ALTER TABLE public.weekly_menu_items REPLICA IDENTITY FULL;
ALTER TABLE public.beverages REPLICA IDENTITY FULL;
ALTER TABLE public.beverage_categories REPLICA IDENTITY FULL;
ALTER TABLE public.weekly_menu_days REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_menu_items; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.beverages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.beverage_categories; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_menu_days; EXCEPTION WHEN duplicate_object THEN NULL; END;
END$$;