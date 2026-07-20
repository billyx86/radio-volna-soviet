/* eslint-disable */
// @ts-nocheck
// Generated route tree for Radio Volna

import { Route as rootRouteImport } from "./routes/__root";
import { Route as IndexRouteImport } from "./routes/index";

const IndexRoute = IndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRouteImport,
} as any);

export interface FileRoutesByPath {
  "/": {
    id: "/";
    path: "/";
    fullPath: "/";
    preLoaderRoute: typeof IndexRouteImport;
    parentRoute: typeof rootRouteImport;
  };
}

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof IndexRouteImport;
      parentRoute: typeof rootRouteImport;
    };
  }
}

export const routeTree = rootRouteImport
  ._addFileChildren({ IndexRoute })
  ._addFileTypes<FileRoutesByPath>();
