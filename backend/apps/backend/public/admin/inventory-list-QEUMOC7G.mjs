import {
  INVENTORY_ITEM_IDS_KEY
} from "./chunk-JHATTPS3.mjs";
import "./chunk-3GLXEMCN.mjs";
import "./chunk-LQTHYS2Z.mjs";
import {
  _DataTable,
  useDataTable
} from "./chunk-7TWTWTDT.mjs";
import "./chunk-HQKGZADC.mjs";
import "./chunk-EMIHDNB7.mjs";
import "./chunk-XRM7PIRS.mjs";
import {
  ConfigurableDataTable
} from "./chunk-YBQ5L5LG.mjs";
import "./chunk-3UMI3ISU.mjs";
import "./chunk-RIV7FKGN.mjs";
import "./chunk-CEYKNZTH.mjs";
import "./chunk-WRSGHGAT.mjs";
import "./chunk-MOSRJHJ3.mjs";
import "./chunk-R65S6ZZV.mjs";
import {
  createTableAdapter
} from "./chunk-UZVGDY3G.mjs";
import "./chunk-IHA2XWHD.mjs";
import "./chunk-3DUKCSX3.mjs";
import "./chunk-EJWRAUTW.mjs";
import "./chunk-42NRZXK4.mjs";
import "./chunk-NTEWUH4C.mjs";
import "./chunk-DBJBDAZN.mjs";
import "./chunk-XEEPMJRY.mjs";
import "./chunk-P5RN6AUG.mjs";
import "./chunk-QDH4NZOQ.mjs";
import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";
import "./chunk-DG7J63J2.mjs";
import "./chunk-LPEUYMRK.mjs";
import "./chunk-2ONQ56DK.mjs";
import {
  useQueryParams
} from "./chunk-C76H5USB.mjs";
import {
  LayoutComposer
} from "./chunk-Z3OGJXAM.mjs";
import "./chunk-HFX2KPQD.mjs";
import "./chunk-5SZFF255.mjs";
import {
  useFeatureFlag
} from "./chunk-PJU3RODH.mjs";
import "./chunk-ZH57KBU7.mjs";
import "./chunk-ZY7CAOHZ.mjs";
import "./chunk-3BQAAPDR.mjs";
import "./chunk-MNXC6Q4F.mjs";
import "./chunk-QJ63TWAK.mjs";
import {
  useStockLocations
} from "./chunk-BGQF2VTH.mjs";
import {
  useDeleteInventoryItem,
  useInventoryItems
} from "./chunk-TPANFD43.mjs";
import "./chunk-7AXHHXCX.mjs";
import {
  ActionMenu
} from "./chunk-OZPB6JBL.mjs";
import "./chunk-OC7BQLYI.mjs";
import "./chunk-S4DMV3ZT.mjs";
import "./chunk-ACQJSQ5A.mjs";
import "./chunk-SEMVMECK.mjs";
import "./chunk-NFEK63OE.mjs";
import "./chunk-QZ7TP4HQ.mjs";

// src/routes/inventory/inventory-list/inventory-list.tsx
import { CORE_LAYOUT_IDS } from "@medusajs/admin-shared";

// src/routes/inventory/inventory-list/components/configurable-inventory-list-table.tsx
import { useTranslation as useTranslation3 } from "react-i18next";

// src/routes/inventory/inventory-list/components/inventory-table-adapter.tsx
import { useMemo } from "react";
import { useTranslation as useTranslation2 } from "react-i18next";
import { useNavigate } from "react-router-dom";

// src/routes/inventory/inventory-list/components/inventory-actions.tsx
import { PencilSquare, Trash } from "@medusajs/icons";
import { usePrompt } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var InventoryActions = ({ item }) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const { mutateAsync } = useDeleteInventoryItem(item.id);
  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("inventory.deleteWarning"),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel")
    });
    if (!res) {
      return;
    }
    await mutateAsync();
  };
  return /* @__PURE__ */ jsx(
    ActionMenu,
    {
      groups: [
        {
          actions: [
            {
              icon: /* @__PURE__ */ jsx(PencilSquare, {}),
              label: t("actions.edit"),
              to: `${item.id}/edit`
            }
          ]
        },
        {
          actions: [
            {
              icon: /* @__PURE__ */ jsx(Trash, {}),
              label: t("actions.delete"),
              onClick: handleDelete
            }
          ]
        }
      ]
    }
  );
};

// src/routes/inventory/inventory-list/components/inventory-table-adapter.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function createInventoryTableAdapter({
  t,
  navigate
}) {
  return createTableAdapter({
    entity: "inventory-items",
    queryPrefix: "inv",
    pageSize: 20,
    emptyState: {
      empty: {
        heading: t("general.noRecordsMessage")
      },
      filtered: {
        heading: t("general.noRecordsMessage"),
        description: t("general.noRecordsMessageFiltered")
      }
    },
    enableRowSelection: true,
    commands: [
      {
        label: t("inventory.stock.action"),
        shortcut: "i",
        action: (selection) => {
          navigate(
            `stock?${INVENTORY_ITEM_IDS_KEY}=${Object.keys(selection).join(
              ","
            )}`
          );
        }
      }
    ],
    useData: (fields, params) => {
      const { inventory_items, count, isError, error, isPending } = useInventoryItems({
        fields,
        ...params
      });
      return {
        data: inventory_items,
        count,
        isLoading: isPending,
        isError,
        error
      };
    },
    getRowHref: (row) => `/inventory/${row.id}`,
    renderRowActions: (row) => /* @__PURE__ */ jsx2(InventoryActions, { item: row }),
    transformColumns: (columns) => {
      const ALLOWED_FILTERS = [
        "id",
        "sku",
        "origin_country",
        "mid_code",
        "hs_code",
        "material",
        "requires_shipping",
        "weight",
        "length",
        "height",
        "width",
        "location"
      ];
      return columns.map((column) => {
        const isFilterDisabled = !ALLOWED_FILTERS.includes(column.field);
        return {
          ...column,
          filter: isFilterDisabled ? { ...column.filter, enabled: false } : column.filter
        };
      });
    }
  });
}
function useInventoryTableAdapter() {
  const { t } = useTranslation2();
  const navigate = useNavigate();
  return useMemo(
    () => createInventoryTableAdapter({ t, navigate }),
    [t, navigate]
  );
}

// src/routes/inventory/inventory-list/components/configurable-inventory-list-table.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var ConfigurableInventoryListTable = () => {
  const { t } = useTranslation3();
  const adapter = useInventoryTableAdapter();
  return /* @__PURE__ */ jsx3(
    ConfigurableDataTable,
    {
      adapter,
      heading: t("inventory.domain"),
      subHeading: t("inventory.subtitle"),
      actions: [{ label: t("actions.create"), to: "create" }]
    }
  );
};

// src/routes/inventory/inventory-list/components/inventory-list-table.tsx
import { Button, Container, Heading, Text } from "@medusajs/ui";
import { useState } from "react";
import { useTranslation as useTranslation6 } from "react-i18next";
import { Link, useNavigate as useNavigate2 } from "react-router-dom";

// src/routes/inventory/inventory-list/components/use-inventory-table-columns.tsx
import { Checkbox } from "@medusajs/ui";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo as useMemo2 } from "react";
import { useTranslation as useTranslation4 } from "react-i18next";
import { jsx as jsx4 } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useInventoryTableColumns = () => {
  const { t } = useTranslation4();
  return useMemo2(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return /* @__PURE__ */ jsx4(
            Checkbox,
            {
              checked: table.getIsSomePageRowsSelected() ? "indeterminate" : table.getIsAllPageRowsSelected(),
              onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value)
            }
          );
        },
        cell: ({ row }) => {
          return /* @__PURE__ */ jsx4(
            Checkbox,
            {
              checked: row.getIsSelected(),
              onCheckedChange: (value) => row.toggleSelected(!!value),
              onClick: (e) => {
                e.stopPropagation();
              }
            }
          );
        }
      }),
      columnHelper.accessor("title", {
        header: t("fields.title"),
        cell: ({ getValue }) => {
          const title = getValue();
          if (!title) {
            return /* @__PURE__ */ jsx4(PlaceholderCell, {});
          }
          return /* @__PURE__ */ jsx4("div", { className: "flex size-full items-center overflow-hidden", children: /* @__PURE__ */ jsx4("span", { className: "truncate", children: title }) });
        }
      }),
      columnHelper.accessor("sku", {
        header: t("fields.sku"),
        cell: ({ getValue }) => {
          const sku = getValue();
          if (!sku) {
            return /* @__PURE__ */ jsx4(PlaceholderCell, {});
          }
          return /* @__PURE__ */ jsx4("div", { className: "flex size-full items-center overflow-hidden", children: /* @__PURE__ */ jsx4("span", { className: "truncate", children: sku }) });
        }
      }),
      columnHelper.accessor("reserved_quantity", {
        header: t("inventory.reserved"),
        cell: ({ getValue }) => {
          const quantity = getValue();
          if (Number.isNaN(quantity)) {
            return /* @__PURE__ */ jsx4(PlaceholderCell, {});
          }
          return /* @__PURE__ */ jsx4("div", { className: "flex size-full items-center overflow-hidden", children: /* @__PURE__ */ jsx4("span", { className: "truncate", children: quantity }) });
        }
      }),
      columnHelper.accessor("stocked_quantity", {
        header: t("fields.inStock"),
        cell: ({ getValue }) => {
          const quantity = getValue();
          if (Number.isNaN(quantity)) {
            return /* @__PURE__ */ jsx4(PlaceholderCell, {});
          }
          return /* @__PURE__ */ jsx4("div", { className: "flex size-full items-center overflow-hidden", children: /* @__PURE__ */ jsx4("span", { className: "truncate", children: quantity }) });
        }
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => /* @__PURE__ */ jsx4(InventoryActions, { item: row.original })
      })
    ],
    [t]
  );
};

// src/routes/inventory/inventory-list/components/use-inventory-table-filters.tsx
import { useTranslation as useTranslation5 } from "react-i18next";
var useInventoryTableFilters = () => {
  const { t } = useTranslation5();
  const { stock_locations } = useStockLocations({
    limit: 1e3
  });
  const filters = [];
  if (stock_locations) {
    const stockLocationFilter = {
      type: "select",
      options: stock_locations.map((s) => ({
        label: s.name,
        value: s.id
      })),
      key: "location_id",
      searchable: true,
      label: t("fields.location")
    };
    filters.push(stockLocationFilter);
  }
  filters.push({
    type: "string",
    key: "material",
    label: t("fields.material")
  });
  filters.push({
    type: "string",
    key: "sku",
    label: t("fields.sku")
  });
  filters.push({
    type: "string",
    key: "mid_code",
    label: t("fields.midCode")
  });
  filters.push({
    type: "number",
    key: "height",
    label: t("fields.height")
  });
  filters.push({
    type: "number",
    key: "width",
    label: t("fields.width")
  });
  filters.push({
    type: "number",
    key: "length",
    label: t("fields.length")
  });
  filters.push({
    type: "number",
    key: "weight",
    label: t("fields.weight")
  });
  filters.push({
    type: "select",
    options: [
      { label: t("fields.true"), value: "true" },
      { label: t("fields.false"), value: "false" }
    ],
    key: "requires_shipping",
    multiple: false,
    label: t("fields.requiresShipping")
  });
  return filters;
};

// src/routes/inventory/inventory-list/components/use-inventory-table-query.tsx
var useInventoryTableQuery = ({
  pageSize = 20,
  prefix
}) => {
  const raw = useQueryParams(
    [
      "id",
      "location_id",
      "q",
      "order",
      "requires_shipping",
      "offset",
      "sku",
      "origin_country",
      "material",
      "mid_code",
      "hs_code",
      "order",
      "weight",
      "width",
      "length",
      "height"
    ],
    prefix
  );
  const {
    offset,
    weight,
    width,
    length,
    height,
    requires_shipping,
    ...params
  } = raw;
  const searchParams = {
    limit: pageSize,
    offset: offset ? parseInt(offset) : void 0,
    weight: weight ? JSON.parse(weight) : void 0,
    width: width ? JSON.parse(width) : void 0,
    length: length ? JSON.parse(length) : void 0,
    height: height ? JSON.parse(height) : void 0,
    requires_shipping: requires_shipping ? JSON.parse(requires_shipping) : void 0,
    q: params.q,
    sku: params.sku,
    order: params.order,
    mid_code: params.mid_code,
    hs_code: params.hs_code,
    material: params.material,
    location_levels: {
      location_id: params.location_id || []
    },
    id: params.id ? params.id.split(",") : void 0
  };
  return {
    searchParams,
    raw
  };
};

// src/routes/inventory/inventory-list/components/inventory-list-table.tsx
import { jsx as jsx5, jsxs } from "react/jsx-runtime";
var PAGE_SIZE = 20;
var InventoryListTable = () => {
  const { t } = useTranslation6();
  const navigate = useNavigate2();
  const [selection, setSelection] = useState({});
  const { searchParams, raw } = useInventoryTableQuery({
    pageSize: PAGE_SIZE
  });
  const {
    inventory_items,
    count,
    isPending: isLoading,
    isError,
    error
  } = useInventoryItems({
    ...searchParams
  });
  const filters = useInventoryTableFilters();
  const columns = useInventoryTableColumns();
  const { table } = useDataTable({
    data: inventory_items,
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
    enableRowSelection: true,
    rowSelection: {
      state: selection,
      updater: setSelection
    }
  });
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsxs(Container, { className: "divide-y p-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx5(Heading, { children: t("inventory.domain") }),
        /* @__PURE__ */ jsx5(Text, { className: "text-ui-fg-subtle", size: "small", children: t("inventory.subtitle") })
      ] }),
      /* @__PURE__ */ jsx5(Button, { size: "small", variant: "secondary", asChild: true, children: /* @__PURE__ */ jsx5(Link, { to: "create", children: t("actions.create") }) })
    ] }),
    /* @__PURE__ */ jsx5(
      _DataTable,
      {
        table,
        columns,
        pageSize: PAGE_SIZE,
        count,
        isLoading,
        pagination: true,
        search: true,
        filters,
        queryObject: raw,
        orderBy: [
          { key: "title", label: t("fields.title") },
          { key: "sku", label: t("fields.sku") },
          { key: "stocked_quantity", label: t("fields.inStock") },
          { key: "reserved_quantity", label: t("inventory.reserved") }
        ],
        navigateTo: (row) => `${row.id}`,
        commands: [
          {
            action: async (selection2) => {
              navigate(
                `stock?${INVENTORY_ITEM_IDS_KEY}=${Object.keys(selection2).join(
                  ","
                )}`
              );
            },
            label: t("inventory.stock.action"),
            shortcut: "i"
          }
        ]
      }
    )
  ] });
};

// src/routes/inventory/inventory-list/inventory-list.tsx
import { Fragment, jsx as jsx6 } from "react/jsx-runtime";
var InventoryItemListTable = () => {
  const isViewConfigEnabled = useFeatureFlag("view_configurations");
  return /* @__PURE__ */ jsx6(
    LayoutComposer,
    {
      widgetsZonePrefix: "inventory_item.list",
      preferredLayoutId: CORE_LAYOUT_IDS.SINGLE_COLUMN,
      sections: {
        main: /* @__PURE__ */ jsx6(Fragment, { children: /* @__PURE__ */ jsx6(LayoutComposer.Entry, { id: "InventoryListTable", children: isViewConfigEnabled ? /* @__PURE__ */ jsx6(ConfigurableInventoryListTable, {}) : /* @__PURE__ */ jsx6(InventoryListTable, {}) }) })
      }
    }
  );
};
export {
  InventoryItemListTable as Component
};
