type cameraBridgeDirectionType = 1 | -1;

type cameraBridgeHandlersType = {
  rotate: (direction: cameraBridgeDirectionType) => void;
  zoom: (direction: cameraBridgeDirectionType) => void;
  startRotate: (direction: cameraBridgeDirectionType) => void;
  stopRotate: () => void;
};

const noopHandlers: cameraBridgeHandlersType = {
  rotate: () => {},
  zoom: () => {},
  startRotate: () => {},
  stopRotate: () => {},
};

const handlersRef: { current: cameraBridgeHandlersType } = { current: noopHandlers };

const registerCameraBridgeHandlers = (handlers: cameraBridgeHandlersType) => {
  handlersRef.current = handlers;
  return () => {
    handlersRef.current = noopHandlers;
  };
};

const cameraBridge: cameraBridgeHandlersType = {
  rotate: (direction) => handlersRef.current.rotate(direction),
  zoom: (direction) => handlersRef.current.zoom(direction),
  startRotate: (direction) => handlersRef.current.startRotate(direction),
  stopRotate: () => handlersRef.current.stopRotate(),
};

export { cameraBridge, registerCameraBridgeHandlers };
export type { cameraBridgeDirectionType };
