import React from "react";
import { List, Datagrid, TextField, DateField, EditButton, DeleteButton } from "react-admin";
import styled from "@emotion/styled";

import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Typography from "@material-ui/core/Typography";

const cardStyle = {
  width: "calc(25% - 1rem)",
  minWidth: 300,
  margin: "0.5rem",
  display: "flex",
  flexDirection: "column",
  verticalAlign: "top",
  flex: 1
};

const ImageWrapper = styled.div`
  height: 0;
  padding-top: 70%;
  position: relative;
`;

const Image = styled.img`
  object-fit: cover;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const getArticleTextSummary = text => {
  const div = document.createElement("div");
  div.innerHTML = text;
  const textData = div.textContent || div.innerText || "";
  return textData.slice(0, 100) + "...";
};

const CommentGrid = ({ ids, data, basePath }) => (
  <div style={{ margin: "1em", display: "flex", flexWrap: "wrap" }}>
    {ids.map(id => (
      <Card key={id} style={cardStyle}>
        <ImageWrapper>
          <Image src={data[id].imageUrl} />
        </ImageWrapper>
        <CardContent>
          <Typography variant="title" style={{ marginBottom: "0.15rem" }}>
            {data[id].title}
          </Typography>
          <Typography variant="caption" color="textSecondary" paragraph>
            {data[id].subtitle}
          </Typography>
          <Typography dangerouslySetInnerHTML={{ __html: getArticleTextSummary(data[id].text) }} paragraph />
        </CardContent>
        <CardActions style={{ textAlign: "right", marginTop: "auto", justifyContent: "space-between" }}>
          <DateField
            record={data[id]}
            source="createdAt"
            style={{
              fontWeight: "semi-bold",
              color: "rgba(0,0,0,.3)"
            }}
          />
          <div>
            <EditButton resource="articles" basePath={basePath} record={data[id]} />
            <DeleteButton resource="articles" basePath={basePath} record={data[id]} />
          </div>
        </CardActions>
      </Card>
    ))}
  </div>
);
CommentGrid.defaultProps = {
  data: {},
  ids: []
};

export const ArticleList = props => (
  <List {...props}>
    <CommentGrid />
  </List>
);
