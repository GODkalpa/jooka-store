import {
  defineCellRenderer
} from "./chunk-IHA2XWHD.mjs";
import "./chunk-3DUKCSX3.mjs";
import "./chunk-EJWRAUTW.mjs";
import "./chunk-42NRZXK4.mjs";
import "./chunk-NTEWUH4C.mjs";
import "./chunk-DBJBDAZN.mjs";
import "./chunk-XEEPMJRY.mjs";
import "./chunk-P5RN6AUG.mjs";
import "./chunk-QDH4NZOQ.mjs";
import "./chunk-P3UUX2T6.mjs";
import "./chunk-DG7J63J2.mjs";
import {
  DashboardApp
} from "./chunk-QIJSUXW3.mjs";
import "./chunk-ONB3JEHR.mjs";
import "./chunk-JAW6ZD7F.mjs";
import "./chunk-TO7QJZLE.mjs";
import "./chunk-4GQOUCX6.mjs";
import "./chunk-K5OJP3ZJ.mjs";
import "./chunk-SGUYOGWH.mjs";
import "./chunk-BPIG7PI6.mjs";
import "./chunk-D3YQN7HV.mjs";
import "./chunk-LPEUYMRK.mjs";
import "./chunk-Z3OGJXAM.mjs";
import "./chunk-HFX2KPQD.mjs";
import "./chunk-5SZFF255.mjs";
import "./chunk-PJU3RODH.mjs";
import "./chunk-ZH57KBU7.mjs";
import "./chunk-ZY7CAOHZ.mjs";
import "./chunk-3BQAAPDR.mjs";
import "./chunk-MNXC6Q4F.mjs";
import "./chunk-QJ63TWAK.mjs";
import "./chunk-UBW4T4MS.mjs";
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
import "./chunk-LYZ7OUA3.mjs";
import "./chunk-D3TDNKSZ.mjs";
import "./chunk-TPANFD43.mjs";
import "./chunk-7AXHHXCX.mjs";
import "./chunk-OZPB6JBL.mjs";
import "./chunk-OC7BQLYI.mjs";
import "./chunk-S4DMV3ZT.mjs";
import "./chunk-ACQJSQ5A.mjs";
import "./chunk-SEMVMECK.mjs";
import "./chunk-NFEK63OE.mjs";
import "./chunk-QZ7TP4HQ.mjs";

// src/app.tsx
import displayModule from "virtual:medusa/displays";
import formModule from "virtual:medusa/forms";
import i18nModule from "virtual:medusa/i18n";
import layoutModule from "virtual:medusa/layouts";
import menuItemModule from "virtual:medusa/menu-items";
import routeModule from "virtual:medusa/routes";
import widgetModule from "virtual:medusa/widgets";
import "virtual:medusa/cell-renderers";
import { jsx } from "react/jsx-runtime";
var localPlugin = {
  widgetModule,
  routeModule,
  displayModule,
  formModule,
  menuItemModule,
  i18nModule,
  layoutModule
};
function App({ plugins = [] }) {
  const app = new DashboardApp({
    plugins: [localPlugin, ...plugins]
  });
  return /* @__PURE__ */ jsx("div", { children: app.render() });
}
var app_default = App;
export {
  app_default as default,
  defineCellRenderer
};
