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
      <SheetJSReactAoO data={value}/>
    </FieldContainer>
  );

export const Cell = ({ item, field }) => {
  return <SheetJSReactAoO data={item[field.path]}/>;
};

export const CardValue = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <h1>{JSON.stringify(item[field.path])}</h1>
      <SheetJSReactAoO data={item[field.path]}/>
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