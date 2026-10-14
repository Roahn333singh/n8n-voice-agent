DO $$
DECLARE r record; m bigint;
BEGIN
  FOR r IN
    SELECT seq.relname AS seqname, t.relname AS tbl, a.attname AS col
    FROM pg_class seq
    JOIN pg_depend d ON d.objid = seq.oid AND d.deptype IN ('a', 'i')
    JOIN pg_class t ON t.oid = d.refobjid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
    JOIN pg_namespace n ON n.oid = seq.relnamespace
    WHERE seq.relkind = 'S' AND n.nspname = 'public'
  LOOP
    EXECUTE format('SELECT max(%I) FROM public.%I', r.col, r.tbl) INTO m;
    IF m IS NOT NULL THEN
      PERFORM setval(format('public.%I', r.seqname)::regclass, m, true);
      RAISE NOTICE '% -> %', r.seqname, m;
    END IF;
  END LOOP;
END $$;
