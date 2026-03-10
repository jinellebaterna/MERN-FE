import { CSSTransition } from "react-transition-group";
import { useRef } from "react";
import ReactDOM from "react-dom";

import "./sideDrawer.css";

const SideDrawer = ({ show, children }) => {
  const nodeRef = useRef(null);

  const content = (
    <CSSTransition
      in={show}
      timeout={200}
      classNames="slide-in-left"
      mountOnEnter
      unmountOnExit
      appear
      nodeRef={nodeRef}
    >
      <aside ref={nodeRef} className="side-drawer">
        {children}
      </aside>
    </CSSTransition>
  );

  return ReactDOM.createPortal(content, document.getElementById("drawer-hook"));
};

export default SideDrawer;
