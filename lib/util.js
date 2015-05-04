var Util = {
  removeLeadingSlash: function(str) {
    if (str[0] === '/') return str.substr(1);
    else return str;
  }
};

module.exports = Util;
