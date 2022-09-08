import React, { useCallback, useEffect, useState } from "react";
import { utils, writeFileXLSX } from 'xlsx';

export default function SheetJSReactAoO() {

  const data =[
    { Name: "Bill Clinton", Index: 42 },
    { Name: "GeorgeW Bush", Index: 43 },
    { Name: "Barack Obama", Index: 44 },
    { Name: "Donald Trump", Index: 45 },
    { Name: "Joseph Biden", Index: 46 }
  ]
  /* get state data and export to XLSX */
  const exportFile = useCallback(() => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, "SheetJSReactAoO.xlsx");
  }, []);

  return (<button onClick={exportFile}>Export XLSX</button>);
}