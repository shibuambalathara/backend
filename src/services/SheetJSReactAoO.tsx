import React, { useCallback, useEffect, useState } from "react";
import { utils, writeFileXLSX } from 'xlsx';

export default function SheetJSReactAoO({data}) {
  /* get state data and export to XLSX */
  const exportFile = useCallback(() => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, `Event-Report-${new Date().toLocaleDateString()}.xlsx`);
  }, [data]);

  return (<button onClick={exportFile}>Export XLSX</button>);
}