import React from "react";
import get from "lodash/get";
import { Edit, PostTitle, SimpleForm, DisabledInput, TextInput, ImageField, ImageInput } from "react-admin";
import RichTextInput from "ra-input-rich-text";

import CardContent from "@material-ui/core/CardContent";
import { Typography, Grid } from "@material-ui/core";

const validateArticleCreation = fieldNames => values => {
  const errors = {};
  fieldNames.forEach(field => {
    if (!values[field]) {
      errors[field] = "Required";
    }
  });
  return errors;
};

const ArticleTitle = ({ record }) => {
  return (
    <Typography variant="title" style={{ color: "#fff" }}>
      Article {record ? `"${record.title}"` : ""}
    </Typography>
  );
};

const ArticleData = ({ record }) => {
  return (
    <Grid container spacing={24}>
      <Grid item xs={6} direction="column">
        <DisabledInput label="Id" source="id" fullWidth record={record} />
        <TextInput source="title" record={record} fullWidth />
        <TextInput source="subtitle" record={record} fullWidth />
      </Grid>
      <Grid item xs={12} md={6}>
        <img src={record.imageUrl} alt={record.title} style={{ width: "100%", objectFit: "contain" }} />
      </Grid>
    </Grid>
  );
};

export const ArticleEditForm = props => (
  <Edit title={<ArticleTitle />} {...props}>
    <SimpleForm validate={validateArticleCreation(["title", "subtitle", "text"])}>
      <ArticleData />
      <RichTextInput source="text" />
      <ImageInput source="imageUrl" label="Replace Article Image" accept="image/*">
        <ImageField source="imageUrl" title="Article Image" />
      </ImageInput>
    </SimpleForm>
  </Edit>
);
