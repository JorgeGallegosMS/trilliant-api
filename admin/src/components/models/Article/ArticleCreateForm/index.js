import React from "react";
import { Create, Edit, SimpleForm, DisabledInput, TextInput, ImageField, ImageInput } from "react-admin";
import RichTextInput from "ra-input-rich-text";

const validateArticleCreation = fieldNames => values => {
  const errors = {};
  fieldNames.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required";
    }
  });
  return errors;
};

export const ArticleCreateForm = props => (
  <Create {...props}>
    <SimpleForm validate={validateArticleCreation(["title", "subtitle", "text", "image"])} redirect="list">
      <TextInput source="title" />
      <TextInput source="subtitle" />
      <RichTextInput source="text" />
      <ImageInput source="imageUrl" label="Article Image" accept="image/*">
        <ImageField source="imageUrl" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);
