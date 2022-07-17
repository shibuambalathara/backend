/** @jsxRuntime classic */
/** @jsx jsx */
import { FormEvent, useRef, useState } from "react";
import Head from "next/head";

import { PageContainer } from "@keystone-6/core/admin-ui/components";
import {
  jsx,
  Heading,
  Stack,
  Text,
  VisuallyHidden,
  Center,
} from "@keystone-ui/core";
import { Button } from "@keystone-ui/button";
import { FieldContainer, TextInput } from "@keystone-ui/fields";
import { Notice } from "@keystone-ui/notice";

import { useMutation, gql } from "@keystone-6/core/admin-ui/apollo";
import {
  useRawKeystone,
  useReinitContext,
} from "@keystone-6/core/admin-ui/context";

import React from "react";

// Please note that while this capability is driven by Next.js's pages directory
// We do not currently support any of the auxillary methods that Next.js provides i.e. `getStaticProps`
// Presently the only export from the directory that is supported is the page component itself.
export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState("");
  const uploadImage = async (e:any) => {
    e.preventDefault();
    if (!inputRef.current) return;
    // @ts-ignore
    const file = inputRef.current.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
    if (data.error) {
      alert(data.error);
      return;
    }
    setFileName('');
  }
  const onFileChange = () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return; // bail if the user cancels from the file browser
    setFileName(file.name);
    // onChange?.({
    //   kind: "upload",
    //   data: { file, validity: { valid: true } },
    //   previous: value,
    // });
  };
  return (
    <PageContainer header={<Heading type="h3">Import</Heading>}>
      <Head>
        <title>Import</title>
      </Head>
      <Stack
        gap="xlarge"
        as="form"
        across
        onSubmit={async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
        }}
      >
        <Stack gap="large" align="center">
          <VisuallyHidden as="label" htmlFor="identity">
            {"identityField"}
          </VisuallyHidden>
          <FieldContainer as="fieldset" css={{margin:"3rem 1rem"}}>
            <input
              autoComplete="off"
              autoFocus={true}
              ref={inputRef}
              name="file"
              onChange={onFileChange}
              type="file"
              accept=".xlsx"
              multiple={false}
              hidden
            />
            <Stack gap="large" as="div">
              {fileName === "" ? (
                <Button
                  size="large"
                  onClick={() => inputRef.current?.click()}
                  tone="positive"
                >
                  select excel file to import
                </Button>
              ) : (
                <div css={{ display: "inline-table" }}>
                  <Text css={{ display: "inline", padding:"0.5rem" }}>{fileName}</Text>
                  <Button
                    size="small"
                    onClick={() => setFileName("")}
                    tone="negative"
                  >
                    X
                  </Button>
                </div>
              )}
            </Stack>
            <Button type="submit" onClick={uploadImage} size="large" css={{marginTop:"3rem"}}>Submit</Button>
            {false &&<Notice title="Error" tone="negative" css={{ marginTop: "1rem" }}>
              {"error.message"}
            </Notice>}
          </FieldContainer>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
