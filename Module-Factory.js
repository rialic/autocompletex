const ModuleFactory = obj => {
    const object = {...obj()};

    Object.setPrototypeOf(object, obj.prototype);

    return object;
};