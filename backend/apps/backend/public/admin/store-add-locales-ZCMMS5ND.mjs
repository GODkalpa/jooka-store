import {
  AddLocalesForm
} from "./chunk-UKUA3JVK.mjs";
import "./chunk-6PNOUH6F.mjs";
import "./chunk-DRHDNSJA.mjs";
import "./chunk-LQTHYS2Z.mjs";
import "./chunk-7TWTWTDT.mjs";
import "./chunk-HQKGZADC.mjs";
import "./chunk-EMIHDNB7.mjs";
import "./chunk-XRM7PIRS.mjs";
import "./chunk-P3UUX2T6.mjs";
import "./chunk-IUCDCPJU.mjs";
import "./chunk-6HTZNHPT.mjs";
import "./chunk-LPEUYMRK.mjs";
import "./chunk-C76H5USB.mjs";
import {
  useFeatureFlag
} from "./chunk-PJU3RODH.mjs";
import "./chunk-3BQAAPDR.mjs";
import "./chunk-QJ63TWAK.mjs";
import {
  RouteFocusModal
} from "./chunk-H7AAHR2V.mjs";
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
import {
  useStore
} from "./chunk-YDJ774GR.mjs";
import "./chunk-SKQPG6BC.mjs";
import "./chunk-LYZ7OUA3.mjs";
import "./chunk-D3TDNKSZ.mjs";
import "./chunk-TPANFD43.mjs";
import "./chunk-7AXHHXCX.mjs";
import "./chunk-OC7BQLYI.mjs";
import "./chunk-S4DMV3ZT.mjs";
import "./chunk-ACQJSQ5A.mjs";
import "./chunk-SEMVMECK.mjs";
import "./chunk-NFEK63OE.mjs";
import "./chunk-QZ7TP4HQ.mjs";

// src/routes/store/store-add-locales/store-add-locales.tsx
import { useNavigate } from "react-router-dom";
import { jsx } from "react/jsx-runtime";
var StoreAddLocales = () => {
  const isEnabled = useFeatureFlag("translation");
  const navigate = useNavigate();
  const { store, isPending, isError, error } = useStore();
  if (!isEnabled) {
    navigate(-1);
    return null;
  }
  const ready = !!store && !isPending;
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsx(RouteFocusModal, { children: ready && /* @__PURE__ */ jsx(AddLocalesForm, { store }) });
};
export {
  StoreAddLocales as Component
};
