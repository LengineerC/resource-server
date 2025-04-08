/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  testRegex:[
    "/__test__/.*\\.(test|spec)\\.tsx?$"
  ]
};