exports.getdate = function () {
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  return (today = new Date()
    .toLocaleDateString("en-US", options)
    .toUpperCase());
};

exports.getday = function () {
  let options = {
    weekday: "long",
  };
  return (today = new Date()
    .toLocaleDateString("en-US", options)
    .toUpperCase());
};
