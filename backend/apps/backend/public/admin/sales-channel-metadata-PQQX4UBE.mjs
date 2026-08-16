import "./chunk-XRTVFYCW.mjs";
import {
  MetadataForm
} from "./chunk-UEZBIZRM.mjs";
import "./chunk-IUCDCPJU.mjs";
import "./chunk-6HTZNHPT.mjs";
import "./chunk-LPEUYMRK.mjs";
import {
  RouteDrawer
} from "./chunk-ZUBJF5QL.mjs";
import "./chunk-H7AAHR2V.mjs";
import "./chunk-OBQI23QM.mjs";
import "./chunk-R7NV3NTO.mjs";
import "./chunk-HIX2NSSN.mjs";
import "./chunk-EKTC7HGF.mjs";
import "./chunk-2LVQXUFY.mjs";
import "./chunk-EYDZJ522.mjs";
import "./chunk-SDOIEL4H.mjs";
import "./chunk-ISGDOD5J.mjs";
import "./chunk-QG545K2O.mjs";
import "./chunk-QIUJGXDT.mjs";
import "./chunk-DEOCXBV2.mjs";
import "./chunk-ZB3WPQQA.mjs";
import "./chunk-2V5DOTI3.mjs";
import "./chunk-PTP3K7TB.mjs";
import "./chunk-EGZR6JFL.mjs";
import "./chunk-XQMUOXFW.mjs";
import "./chunk-4BG52NTE.mjs";
import "./chunk-6OFSUHM5.mjs";
import "./chunk-3C2RPYDJ.mjs";
import "./chunk-4SIZ37QP.mjs";
import "./chunk-ZUVTNOCX.mjs";
import "./chunk-IWY35GD5.mjs";
import "./chunk-BGQF2VTH.mjs";
import "./chunk-2EQK5L52.mjs";
import "./chunk-EMDIIWVL.mjs";
import "./chunk-YDJ774GR.mjs";
import "./chunk-SKQPG6BC.mjs";
import {
  useSalesChannel,
  useUpdateSalesChannel
} from "./chunk-LYZ7OUA3.mjs";
import "./chunk-D3TDNKSZ.mjs";
import "./chunk-TPANFD43.mjs";
import "./chunk-7AXHHXCX.mjs";
import "./chunk-OC7BQLYI.mjs";
import "./chunk-S4DMV3ZT.mjs";
import "./chunk-ACQJSQ5A.mjs";
import "./chunk-SEMVMECK.mjs";
import "./chunk-NFEK63OE.mjs";
import "./chunk-QZ7TP4HQ.mjs";

// src/routes/sales-channels/sales-channel-metadata/sales-channel-metadata.tsx
import { useParams } from "react-router-dom";
import { jsx } from "react/jsx-runtime";
var SalesChannelMetadata = () => {
  const { id } = useParams();
  const {
    sales_channel: salesChannel,
    isPending,
    isError,
    error
  } = useSalesChannel(id ?? "");
  const { mutateAsync, isPending: isMutating } = useUpdateSalesChannel(id ?? "");
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsx(RouteDrawer, { children: /* @__PURE__ */ jsx(
    MetadataForm,
    {
      isPending,
      isMutating,
      hook: mutateAsync,
      metadata: salesChannel?.metadata
    }
  ) });
};
export {
  SalesChannelMetadata as Component
};
