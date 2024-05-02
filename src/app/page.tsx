"use client";

import InputGroup from "@/components/InputGroup/InputGroup";
import * as React from "react";
import { WorkBook, utils, read } from "xlsx";
import OutputTable from "@/components/OutputTable/OutputTable";
import nextConfig from "../../next.config.mjs";
import Welcome from "@/components/Welcome/Welcome";
import { InputRow } from "@/types/xlsx-types";

const XLSX_CALC = require("xlsx-calc");

// install a webpack loader for this?
const MODEL_LINK = nextConfig.basePath + "/model.xlsm";

export default function Home() {
  const [workbook, setWorkbook] = React.useState<WorkBook>();
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch(MODEL_LINK)
      .then((res) => res.arrayBuffer())
      .then(read)
      .then(setWorkbook)
      .catch(console.error);
  }, []);

  const onInputSubmit = (data: InputRow[]) => {
    setLoading(true);

    const tmp = structuredClone(workbook);
    console.log(tmp);

    // FIXME: origin should be in the callback, parse it out from the cellRange prop
    utils.sheet_add_aoa(tmp!.Sheets["Main Page"], data, { origin: "B9" });

    XLSX_CALC(tmp, { continue_after_error: true });

    console.log(tmp);
    setWorkbook(tmp);

    setLoading(false);
  };

  return (
    <>
      <Welcome />
      <div style={{ height: "50vh", display: "flex", flexDirection: "row" }}>
        <div style={{ width: "50%" }}>
          <InputGroup
            workbook={workbook!}
            sheet="Main Page"
            cellRange="B9:C16"
            onSubmit={onInputSubmit}
            loading={loading}
          />
        </div>
        <div style={{ width: "50%" }}>
          <OutputTable
            workbook={workbook!}
            sheet="Main Page"
            cellRange="B20:C30"
            labels
          />
        </div>
      </div>
    </>
  );
}
