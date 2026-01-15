import React from "react";
import PropTypes from "prop-types";

const LabelAtom = ({ htmlFor, children, className = "", ...rest }) => {
  // Base styling for form labels
  const baseStyle = "block text-sm font-medium text-gray-700 mb-1 select-none";

  return (
    <label htmlFor={htmlFor} className={`${baseStyle} ${className}`} {...rest}>
      {children}
    </label>
  );
};

LabelAtom.propTypes = {
  htmlFor: PropTypes.string.isRequired, // Connects the label to the input via its 'id'
  children: PropTypes.node.isRequired, // The text content of the label
  className: PropTypes.string,
};

LabelAtom.defaultProps = {
  className: "",
};

export default LabelAtom;
