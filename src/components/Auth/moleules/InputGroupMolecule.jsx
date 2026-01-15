import React from "react";
import PropTypes from "prop-types";
import InputAtom from "../Atoms/IntputAtom";
import LabelAtom from "../Atoms/LabelAtom";

const InputGroupMolecule = ({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  ...rest
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {/* 1. LabelAtom uses 'id' for 'htmlFor' */}
      <LabelAtom htmlFor={id}>{label}</LabelAtom>

      {/* 2. InputAtom uses 'id' to be connected to the label */}
      <InputAtom
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        // Pass any remaining props (e.g., required, autoComplete) to the input
        {...rest}
      />
    </div>
  );
};

InputGroupMolecule.propTypes = {
  label: PropTypes.string.isRequired, // Text displayed in the label
  id: PropTypes.string.isRequired, // Must be unique; links label and input
  type: PropTypes.oneOf(["text", "email", "password", "number"]),
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

InputGroupMolecule.defaultProps = {
  type: "text",
  className: "",
};

export default InputGroupMolecule;
