import { useVirtualizer } from "@tanstack/react-virtual";
import fuzzysort from "fuzzysort";
import { ArrowDownAZ, ArrowUpAZ, ChevronsUpDown, Search } from "lucide-react";
import { type ReactNode, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { TemplateRecord } from "./template-records";
import { useTemplateRecords } from "./use-template-records";

type SortDirection = "asc" | "desc";
type SortKey = keyof Pick<
  TemplateRecord,
  | "project"
  | "owner"
  | "status"
  | "priority"
  | "category"
  | "impactScore"
  | "updatedAt"
>;

type Column = {
  key: SortKey;
  label: string;
  className?: string;
  render?: (record: TemplateRecord) => ReactNode;
};

const pageSize = 18;
const rowGrid =
  "grid-cols-[minmax(180px,1.45fr)_minmax(120px,0.8fr)_minmax(112px,0.7fr)_minmax(96px,0.55fr)_minmax(104px,0.55fr)_minmax(128px,0.65fr)_minmax(280px,1.8fr)]";
const searchableFields: Array<keyof TemplateRecord> = [
  "project",
  "owner",
  "status",
  "priority",
  "category",
  "summary",
];

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
  year: "numeric",
});

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

const columns: Column[] = [
  {
    key: "project",
    label: "Project",
    render: (record) => (
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">
          {record.project}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {record.id}
        </div>
      </div>
    ),
  },
  { key: "owner", label: "Owner" },
  {
    key: "status",
    label: "Status",
    render: (record) => (
      <Badge
        variant={record.status === "Blocked" ? "destructive" : "outline"}
        className={cn(
          "border-transparent",
          record.status === "Done" && "bg-emerald-50 text-emerald-700",
          record.status === "In Progress" && "bg-blue-50 text-blue-700",
          record.status === "Review" && "bg-amber-50 text-amber-700",
          record.status === "Backlog" && "bg-muted text-muted-foreground",
        )}
      >
        {record.status}
      </Badge>
    ),
  },
  { key: "priority", label: "Priority" },
  {
    key: "impactScore",
    label: "Impact",
    className: "tabular-nums",
  },
  {
    key: "updatedAt",
    label: "Updated",
    className: "text-muted-foreground",
    render: (record) => dateFormatter.format(new Date(record.updatedAt)),
  },
];

function compareRecords(
  left: TemplateRecord,
  right: TemplateRecord,
  key: SortKey,
  direction: SortDirection,
) {
  const leftValue = left[key];
  const rightValue = right[key];
  const multiplier = direction === "asc" ? 1 : -1;

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return (leftValue - rightValue) * multiplier;
  }

  return collator.compare(String(leftValue), String(rightValue)) * multiplier;
}

export function Home() {
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const { error, isLoading, records } = useTemplateRecords();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "updatedAt",
    direction: "desc",
  });

  const filteredRecords = useMemo(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return records;
    }

    return fuzzysort
      .go<TemplateRecord>(trimmedQuery, records, {
        keys: searchableFields,
        threshold: 0.2,
      })
      .map((result) => result.obj);
  }, [query, records]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((left, right) =>
      compareRecords(left, right, sort.key, sort.direction),
    );
  }, [filteredRecords, sort]);

  const visibleRecords = sortedRecords.slice(0, visibleCount);
  const rowVirtualizer = useVirtualizer({
    count: visibleRecords.length,
    estimateSize: () => 60,
    getScrollElement: () => scrollParentRef.current,
    overscan: 8,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  function resetRecordsView() {
    setVisibleCount(pageSize);
    scrollParentRef.current?.scrollTo({ top: 0 });
  }

  function loadMoreIfNeeded() {
    const scrollElement = scrollParentRef.current;

    if (!scrollElement || visibleRecords.length >= sortedRecords.length) {
      return;
    }

    const distanceFromBottom =
      scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight;

    if (distanceFromBottom < 160) {
      setVisibleCount((current) =>
        Math.min(current + pageSize, sortedRecords.length),
      );
    }
  }

  function updateSort(key: SortKey) {
    resetRecordsView();
    setSort((current) => {
      if (current.key !== key) {
        return { key, direction: "asc" };
      }

      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  }

  function updateQuery(value: string) {
    resetRecordsView();
    setQuery(value);
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              Data template
            </p>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              Records
            </h1>
          </div>
          <div className="w-full max-w-sm">
            <label htmlFor="record-search" className="sr-only">
              Search records
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="record-search"
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="Search records"
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3 text-sm text-muted-foreground">
          <span>
            Showing {visibleRecords.length} of {sortedRecords.length} records
          </span>
          <span>
            {isLoading
              ? "Loading records from Dexie"
              : `${records.length} records in Dexie`}
          </span>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </div>
        ) : null}

        <div
          data-template-table-scroller
          ref={scrollParentRef}
          onScroll={loadMoreIfNeeded}
          className="h-[calc(100vh-210px)] min-h-[420px] overflow-auto rounded-md border"
        >
          <Table className="grid min-w-[1040px]">
            <TableHeader className="sticky top-0 z-10 grid bg-background shadow-[0_1px_0_var(--border)]">
              <TableRow
                className={cn("grid border-b-0 hover:bg-transparent", rowGrid)}
              >
                {columns.map((column) => (
                  <TableHead key={column.key} className="flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-ml-2 justify-start px-2"
                      onClick={() => updateSort(column.key)}
                      aria-label={`Sort by ${column.label}`}
                    >
                      {column.label}
                      {sort.key === column.key ? (
                        sort.direction === "asc" ? (
                          <ArrowUpAZ aria-hidden="true" />
                        ) : (
                          <ArrowDownAZ aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown aria-hidden="true" />
                      )}
                    </Button>
                  </TableHead>
                ))}
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody
              className="relative grid"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {virtualRows.map((virtualRow) => {
                const record = visibleRecords[virtualRow.index];

                return (
                  <TableRow
                    key={record.id}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    className={cn(
                      "absolute grid w-full",
                      "hover:bg-muted/40",
                      rowGrid,
                    )}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          "flex h-[60px] items-center",
                          column.className,
                        )}
                      >
                        {column.render
                          ? column.render(record)
                          : String(record[column.key])}
                      </TableCell>
                    ))}
                    <TableCell className="flex h-[60px] items-center text-muted-foreground">
                      <span className="truncate">{record.summary}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center border-t text-sm text-muted-foreground">
              Loading records
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className="flex h-40 items-center justify-center border-t text-sm text-muted-foreground">
              No records found
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
