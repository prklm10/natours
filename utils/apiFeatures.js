class APIFeatures {
  constructor(query, queryString) {
    // query from mongooose
    // queryStr from express
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // it is done beacuse if we just assign query = req.query then the changes made in query will also change req.query
    // 1A) filtering
    const excludeFields = [
      'page',
      'limit',
      'sort',
      'fields',
    ];
    excludeFields.forEach(
      (field) => delete queryObj[field]
    );

    // 1B Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    console.log(JSON.parse(queryStr));
    console.log('asd', queryObj);
    // find returns a query in which we can then perform sort limit etc;

    this.query = this.query.find(
      JSON.parse(queryStr)
    );
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .join(' ');
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit =
      this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    console.log(page, limit, skip);

    this.query = this.query
      .skip(skip)
      .limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
