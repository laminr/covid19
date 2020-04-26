export class ProModel {

  constructor(public employerName = '',
              public employerPosition = '',
              public firstname = '',
              public lastname = '',
              public birthday = new Date(),
              public pob = '',
              public address = '',
              public activity = '',
              public workplace = '',
              public validity = '',
              public mean = '',
              public city = '',
              public today = new Date()
  ) {}
}
