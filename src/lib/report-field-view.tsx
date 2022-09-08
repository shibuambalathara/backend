/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields';

// import { PrettyData } from './PrettyData';

export const Field = ({ field, value }: any ) =>
  value === createViewValue ? null : (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      {/* <PrettyData data={value} /> */}
      {JSON.stringify(value)}
    </FieldContainer>
  );

export const Cell = ({ item, field }) => {
  return <p>{JSON.stringify(item[field.path])}</p>;
};

export const CardValue = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <p>{JSON.stringify(item[field.path])}</p>
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