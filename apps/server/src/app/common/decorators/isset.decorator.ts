import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsSet(
    condition: (object: any, value: any) => boolean,
    validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSet',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [condition],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          console.log(value);
          console.log(args.object);
          const relatedValue = relatedPropertyName(args.object);
          return !relatedValue;
        },
      },
    });
  };
}