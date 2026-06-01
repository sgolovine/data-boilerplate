import { useCallback, useEffect, useState } from "react";
import type { TemplateRecord } from "./template-records";
import { getSeededTemplateRecordsDatabase } from "./template-records.db";

type TemplateRecordsState = {
  error: Error | null;
  isLoading: boolean;
  records: TemplateRecord[];
};

async function queryTemplateRecords() {
  const database = await getSeededTemplateRecordsDatabase();

  return database.templateRecords.toArray();
}

export function useTemplateRecords() {
  const [state, setState] = useState<TemplateRecordsState>({
    error: null,
    isLoading: true,
    records: [],
  });

  const loadRecords = useCallback(async () => {
    setState((current) => ({ ...current, error: null, isLoading: true }));

    try {
      const records = await queryTemplateRecords();

      setState({
        error: null,
        isLoading: false,
        records,
      });
    } catch (error) {
      setState({
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
        records: [],
      });
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitialRecords() {
      try {
        const records = await queryTemplateRecords();

        if (ignore) {
          return;
        }

        setState({
          error: null,
          isLoading: false,
          records,
        });
      } catch (error) {
        if (ignore) {
          return;
        }

        setState({
          error: error instanceof Error ? error : new Error(String(error)),
          isLoading: false,
          records: [],
        });
      }
    }

    void loadInitialRecords();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    ...state,
    refresh: loadRecords,
  };
}
