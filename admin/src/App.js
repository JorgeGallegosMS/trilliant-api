// in src/App.js
import React from "react";
import { Admin, Resource } from "react-admin";

import { ArticleList } from "./components/models/Article/ArticleList";
import { ArticleCreateForm } from "./components/models/Article/ArticleCreateForm";
import { ArticleEditForm } from "./components/models/Article/ArticleEditForm";

import { dataProvider } from "./dataProvider";

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="articles" list={ArticleList} create={ArticleCreateForm} edit={ArticleEditForm} />
  </Admin>
);

export default App;
