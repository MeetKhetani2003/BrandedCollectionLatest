import React from "react";
import PropTypes from "prop-types";

const InputAtom = ({ type = "text", placeholder, className = "", ...rest }) => {
  // Base styling for Auth pages: full width, padding, rounded corners, subtle border,
  // and focus ring for better UX.
  const baseStyle =
    "w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg " +
    "placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "transition duration-150 ease-in-out";

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`${baseStyle} ${className}`}
      // Spread all remaining standard input attributes (value, onChange, required, etc.)
      {...rest}
    />
  );
};

// --- Type Checking with PropTypes ---
InputAtom.propTypes = {
  // Common types for authentication forms
  type: PropTypes.oneOf(["text", "email", "password", "number"]),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  // PropTypes can also check for standard handlers like 'onChange' if needed,
  // but using {...rest} handles the underlying HTML attributes.
};

// Setting a default value for 'type' and 'className'
InputAtom.defaultProps = {
  type: "text",
  className: "",
};

export default InputAtom;
