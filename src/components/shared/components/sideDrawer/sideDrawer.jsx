import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import { useRef } from "react";

import "./sideDrawer.css";

const SideDrawer = props => {
  const nodeRef = useRef(null);
  
  const content = (
    <CSSTransition
      in={props.show}
      timeout={200}
      classNames="slide-in-left"
      mountOnEnter
      unmountOnExit
      nodeRef={nodeRef}
    >
      <aside ref={nodeRef} className="side-drawer" onClick={props.onClick}>
        {props.children}
      </aside>
    </CSSTransition>
  );

  return ReactDOM.createPortal(content, document.getElementById("drawer-hook"));
};

export default SideDrawer;