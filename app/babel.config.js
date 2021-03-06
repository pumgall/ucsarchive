module.exports = {
    plugins: [
      [
        "import",
        {
          libraryName: 'element-plus',
          customStyleName: (name) => {
            // Because of the existence of `customStyleName`, `style: true` will not be effective.
            // So if you want to use the `.scss` source file, you only need to replace the extension name from `.css` to `.scss`
            return `element-plus/lib/theme-chalk/${name}.css`;
          },
        },
      ],
    ],
  };