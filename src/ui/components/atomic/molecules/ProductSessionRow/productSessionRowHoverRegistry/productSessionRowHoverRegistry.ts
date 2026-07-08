let activeProductSessionHoverDismiss: (() => void) | null = null;
let activeProductSessionHoverOwner: object | null = null;

const claimProductSessionHover = (owner: object, dismiss: () => void) => {
  if (activeProductSessionHoverDismiss && activeProductSessionHoverOwner !== owner) {
    activeProductSessionHoverDismiss();
  }

  activeProductSessionHoverOwner = owner;
  activeProductSessionHoverDismiss = dismiss;
};

const releaseProductSessionHover = (owner: object) => {
  if (activeProductSessionHoverOwner === owner) {
    activeProductSessionHoverOwner = null;
    activeProductSessionHoverDismiss = null;
  }
};

export { claimProductSessionHover, releaseProductSessionHover };
