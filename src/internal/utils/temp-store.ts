import { createCLI } from "../create-cli.js";

const { viewsBasePosition, navMenuItemsBasePosition } =
  createCLI();

type positionStore = {
  position: number;
  getPositionAndIncrement: () => number;
};

function getValueAndIncrement(store: positionStore): number {
  const currentPosition = store.position;
  store.position += 1;
  return currentPosition;
}

export const viewsPositionStore: positionStore = {
  position: viewsBasePosition,

  getPositionAndIncrement: function () {
    return getValueAndIncrement(this);
  },
};

export const navMenuItemsPositionStore: positionStore = {
  position: navMenuItemsBasePosition,

  getPositionAndIncrement: function () {
    return getValueAndIncrement(this);
  },
};

export function tempStore() {
  return {
    viewsPositionStore,
    navMenuItemsPositionStore,
  };
}
