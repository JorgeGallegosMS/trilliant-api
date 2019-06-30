import simpleRestProvider from "ra-data-simple-rest";
import omit from "lodash/omit";

const addUploadFeature = requestHandler => (type, resource, params) => {
  if (type === "CREATE" && resource === "articles") {
    // notice that following condition can be true only when `<ImageInput source="pictures" />` component has parameter `multiple={true}`
    // if parameter `multiple` is false, then data.pictures is not an array, but single object
    if (params.data.imageUrl) {
      const nonFileParams = {
        ...omit(params.data, "imageUrl")
      };
      const formData = new FormData();
      Object.keys(nonFileParams).forEach(key => formData.append(key, nonFileParams[key]));
      formData.append("file", params.data.imageUrl.rawFile);

      return fetch("http://localhost:5000/api/articles/", {
        method: "post",
        body: formData
      }).then(res => res.json());
    }
  }
  if (type === "UPDATE" && resource === "articles") {
    // notice that following condition can be true only when `<ImageInput source="pictures" />` component has parameter `multiple={true}`
    // if parameter `multiple` is false, then data.pictures is not an array, but single object
    if (params.data.imageUrl) {
      const nonFileParams = {
        ...omit(params.data, "imageUrl")
      };
      const formData = new FormData();
      Object.keys(nonFileParams).forEach(key => formData.append(key, nonFileParams[key]));
      formData.append("file", params.data.imageUrl.rawFile);

      return fetch(`http://localhost:5000/api/articles/${params.data.id}`, {
        method: "put",
        body: formData
      }).then(res => res.json());
    }
  }
  return requestHandler(type, resource, params);
};

export const dataProvider = addUploadFeature(simpleRestProvider("http://localhost:5000/api"));
