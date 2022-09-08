/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields';
import SheetJSReactAoO from '../services/SheetJSReactAoO';

// import { PrettyData } from './PrettyData';

export const Field = ({ field, value }: any ) =>
  value === createViewValue ? null : (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      {/* <PrettyData data={value} /> */}
      {/* <h1>{JSON.stringify(value)}</h1> */}
      <SheetJSReactAoO />
    </FieldContainer>
  );

export const Cell = ({ item, field }) => {
  return <h1>{JSON.stringify(item[field.path])}</h1>;
};

export const CardValue = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <h1>{JSON.stringify(item[field.path])}</h1>
      <SheetJSReactAoO />
    </FieldContainer>
  );
};

const createViewValue = Symbol('create view virtual field value');

export const controller = (
  config: any
): any => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path}${config.fieldMeta.query}`,
    defaultValue: createViewValue,
    deserialize: data => {
      return data[config.path];
    },
    serialize: () => ({}),
  };
};