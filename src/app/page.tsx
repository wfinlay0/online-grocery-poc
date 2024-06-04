"use client";

import InputGroup from "@/components/InputGroup/InputGroup";
import * as React from "react";
import { WorkBook, utils, read } from "xlsx";
import OutputTable from "@/components/OutputTable/OutputTable";
import nextConfig from "../../next.config.mjs";
import { InputRow } from "@/types/xlsx-types";
import styles from "./page.module.css";
import { Text, Flex, Title, Box } from "@mantine/core";

// install a webpack loader for this?
const MODEL_LINK = nextConfig.basePath + "/modelv7.xlsx";
export const SHEET_NAME = "Main Page";

export default function Home() {
  const [workbook, setWorkbook] = React.useState<WorkBook>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    fetch(MODEL_LINK)
      .then((res) => res.arrayBuffer())
      .then(read)
      .then(setWorkbook)
      .catch(console.error);
  }, []);

  const onInputSubmit = (data: InputRow[], origin: string) => {
    setLoading(true);

    // xlsx-calc is doing a lot of work and will block the UI, so we must run it in a web worker
    if (typeof Worker !== "undefined") {
      const recalcWorker = new Worker(
        new URL("./xlsx-calc.worker.ts", import.meta.url)
      );

      recalcWorker.onmessage = (e) => {
        setWorkbook(e.data);
        setLoading(false);
      };

      const tmp = structuredClone(workbook);
      utils.sheet_add_aoa(tmp!.Sheets[SHEET_NAME], data, { origin });

      // start the worker
      recalcWorker.postMessage(tmp);
    } else {
      setError("Your browser does not support this app.");
    }
  };

  // [ ] extract all cell references to a config file
  return (
    <Box maw={1200} mx={"auto"}>
      <Box maw={500}>
        <Title order={4}>What is this?</Title>
        <Text>
          This is a grocery store picking simulation where you can create
          scenarios to inform your decisions on whether or not to provide
          full-service grocery store picking using a research model created by
          Wharton University.
        </Text>
      </Box>
      <Flex className={styles.ioContainer} gap={"xl"}>
        <div>
          <InputGroup
            workbook={workbook!}
            sheet={SHEET_NAME}
            cellRange="B9:C17"
            onSubmit={onInputSubmit}
            loading={loading}
          />
        </div>
        <div>
          <OutputTable
            workbook={workbook!}
            sheet={SHEET_NAME}
            cellRange="B26:E40"
            labels
            loading={loading}
          />
        </div>
      </Flex>
    </Box>
  );
}
