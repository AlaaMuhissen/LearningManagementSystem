import React, { useState, useEffect } from "react";

const ChangingProgressProvider = ({ values, interval = 1000, children }) => {
  const [valuesIndex, setValuesIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setValuesIndex((prevIndex) => (prevIndex + 1) % values.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval, values.length]);

  return children(values[valuesIndex]);
};

export default ChangingProgressProvider;
