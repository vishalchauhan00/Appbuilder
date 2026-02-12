import React, { useState, useEffect } from "react";
import { FormEngine } from "./FormEngine";
import { getUIInspector } from "../../utils/uiInspectorUtils";

interface Props {
  selectedUI: any;
  uiLocaleJson: any;
}

export const UIInspector: React.FC<Props> = ({
  selectedUI,
  uiLocaleJson,
}) => {
    if (!selectedUI) return null;

    const uiType = getViewUIType(selectedUI) || selectedUI.viewType;

    const [inspector, setInspector] = useState<any>(null);
    useEffect(() => {
        if (!selectedUI) return;

        let alive = true;        

        getUIInspector(uiType, uiLocaleJson).then((inst) => {
            if (alive) setInspector(inst);
        });

        return () => {
            alive = false;
        };
    }, [uiType]);

    if (!inspector) return null;

    const { schema, localeMap, useForm } = inspector;

    return (
        <FormEngine
            schema={schema}
            localeMap={localeMap}
            prefillData={selectedUI}
            useFormOverride={useForm} // 👈 IMPORTANT
        />
    );
};

function getViewUIType(selectedUI:any) {
  let uitype = selectedUI['viewType'];
  if(uitype === 'Button'){
    if(selectedUI.type === "System"){
      uitype = "SystemButton";
    }else if(selectedUI.type === "CheckBox"){
      uitype = "CheckBox";
    }else {
      uitype = getButtontype(selectedUI.buttonType) + 'Button';
    }
  }
  return uitype;
}
function getButtontype(btnType:string) {
  return btnType.charAt(0).toUpperCase() + btnType.substr(1).toLowerCase();
}
