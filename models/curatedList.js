module.exports = (sequelize, DataTypes) => {
  const curatedList = sequelize.define(
    "curatedList",
    {
      name: {
        type: DataTypes.STRING,
        allow: false,
      },
      slug: {
        type: DataTypes.STRING,
        allow: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    }
  );

  // Associations
  curatedList.associate = (models) => {
    curatedList.hasMany(models.curatedListItem, {
      foreignKey: "curatedListId",
    });
  };

  return curatedList;
};
