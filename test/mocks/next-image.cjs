const React = require('react');

module.exports = function MockNextImage(props) {
  const { fill, priority, unoptimized, ...rest } = props;
  return React.createElement('img', rest);
};
