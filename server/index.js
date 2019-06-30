'use strict';
import express from 'express';
import GraphHTTP from 'express-graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import cors from 'cors';

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/graphql',
  GraphHTTP((req) => ({
    // schema: Schema,
    pretty: process.env.NODE_ENV !== 'production',
    graphiql: process.env.NODE_ENV !== 'production',
    // context: {
    //   user: req.user,
    //   model,
    //   seqConnect,
    // },
  }))
);

app.route('/playground')
  .get(expressPlayground({ endpoint: '/graphql' }));


app.use((err, req, res, next) => {
  res.status(500).send(JSON.stringify({
    result: 'internal server error',
    sentry: { eventId },
    message: err.message
  }));

  next();
});


app.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Playground - http://${process.env.HOST}:${process.env.PORT}/playground`);
  console.log(`Trilliant API started on port ${process.env.PORT}`);
});