import {
  MetadataForm
} from "./chunk-UEZBIZRM.mjs";
import "./chunk-IUCDCPJU.mjs";
import "./chunk-6HTZNHPT.mjs";
import "./chunk-LPEUYMRK.mjs";
import "./chunk-ZUBJF5QL.mjs";
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
import "./chunk-LYZ7OUA3.mjs";
import {
  useShippingProfile,
  useUpdateShippingProfile
} from "./chunk-D3TDNKSZ.mjs";
import "./chunk-TPANFD43.mjs";
import "./chunk-7AXHHXCX.mjs";
import "./chunk-OC7BQLYI.mjs";
import "./chunk-S4DMV3ZT.mjs";
import "./chunk-ACQJSQ5A.mjs";
import "./chunk-SEMVMECK.mjs";
import "./chunk-NFEK63OE.mjs";
import "./chunk-QZ7TP4HQ.mjs";

// src/routes/shipping-profiles/shipping-profile-metadata/shipping-profile-metadata.tsx
import { useParams } from "react-router-dom";
import { jsx } from "react/jsx-runtime";
var ShippingProfileMetadata = () => {
  const { shipping_profile_id } = useParams();
  const { shipping_profile, isPending, isError, error } = useShippingProfile(
    shipping_profile_id
  );
  const { mutateAsync, isPending: isMutating } = useUpdateShippingProfile(
    shipping_profile?.id
  );
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsx(
    MetadataForm,
    {
      metadata: shipping_profile?.metadata,
      hook: mutateAsync,
      isPending,
      isMutating
    }
  );
};
export {
  ShippingProfileMetadata as Component
};
