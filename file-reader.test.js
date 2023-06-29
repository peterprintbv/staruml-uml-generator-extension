const fileReader = require('./file-reader');
const UmlElement = require('./uml-element');

const fileContent = `<?php
declare(strict_types=1);

namespace PeterPrint\\Test\\Block;


/**
 * @description  TestClass class
 *
 * @copyright    2023, PeterPrint B.V. <it@peterprint.nl>
 * @license      https://www.peterprint.nl Commercial License
 */
abstract class TestClass extends Test
{
    abstract public function getTest(): string;

    /**
     * @throws LocalizedException
     */
    public function getTestAgain(): Form
    {
        // implementation
    }

    public function getTestWithoutDocs(): ?Fieldset
    {
        // implementation
    }

    /**
     * @throws LocalizedException
     */
    protected static function getTestWithException(string $test): AbstractBlock
    {

    }
}`;

const expectedFunctions = [
    {
        name: 'getTest',
        isAbstract: true,
        isNullableReturn: false,
        isStaticValue: false,
        parameters: '',
        returnType: 'string',
        visibility: 'public'
    },
    {
        isAbstract: false,
        isNullableReturn: false,
        isStaticValue: false,
        name: 'getTestAgain',
        parameters: '',
        returnType: 'Form',
        visibility: 'public'
    },
    {
        isAbstract: false,
        isNullableReturn: true,
        isStaticValue: false,
        name: 'getTestWithoutDocs',
        parameters: '',
        returnType: 'Fieldset',
        visibility: 'public',
    },
    {
        isAbstract: false,
        isNullableReturn: false,
        isStaticValue: true,
        name: 'getTestWithException',
        parameters: 'string $test',
        returnType: 'AbstractBlock',
        visibility: 'protected',
    }
];

test('detects multiple functions in PHP class', () => {
    const extractedFunctions = fileReader.extractFunctionsFromFileContent(fileContent);
    expect(extractedFunctions).toStrictEqual(expectedFunctions);
});

test('detects abstract functions', () => {
    const fileContentWithAbstractFunction = `
        abstract class TestClass extends Test
        {
            abstract public function getTest(): string;
        }
    `;

    const abstractFunction = fileReader.extractFunctionsFromFileContent(fileContentWithAbstractFunction);
    expect(abstractFunction).toStrictEqual([{
        name: 'getTest',
        isAbstract: true,
        isNullableReturn: false,
        isStaticValue: false,
        parameters: '',
        returnType: 'string',
        visibility: 'public'
    }]);
});

test('detects static functions', () => {
    const fileContentWithStaticFunction = `
        abstract class TestClass extends Test
        {
            public static function getTest(): string
            {
            
            }
        }
    `;

    const staticFunction = fileReader.extractFunctionsFromFileContent(fileContentWithStaticFunction);
    expect(staticFunction).toStrictEqual([{
        name: 'getTest',
        isAbstract: false,
        isNullableReturn: false,
        isStaticValue: true,
        parameters: '',
        returnType: 'string',
        visibility: 'public'
    }]);
});

test('detects all visibilities', () => {
    const fileContentWithVisibilities = `
        abstract class TestClass extends Test
        {
            public static function getTestPublic(): string
            {
            
            }
            
            protected static function getTestProtected(): string
            {
            
            }
            
            private static function getTestPrivate(): string
            {
            
            }
        }
    `;

    const visibilityFunctions = fileReader.extractFunctionsFromFileContent(fileContentWithVisibilities);

    const structureWithAllVisibilities = ['public', 'protected', 'private'].map((visibility) => {
        const uppercaseVisibility = visibility.charAt(0).toUpperCase() + visibility.slice(1);
        return {
            name: 'getTest' + uppercaseVisibility,
            isAbstract: false,
            isNullableReturn: false,
            isStaticValue: true,
            parameters: '',
            returnType: 'string',
            visibility: visibility
        };
    });

    expect(visibilityFunctions).toStrictEqual(structureWithAllVisibilities);
});

test('detects constants with visibility', () => {
    const fileContentWithConstants = `
        abstract class TestClass extends Test
        {
            public const TEST_PUBLIC = 'public';
            protected const TEST_PROTECTED = 'protected';
            private const TEST_PRIVATE = 'private';
        }
    `;

    const constants = fileReader.extractConstantsFromFileContent(fileContentWithConstants);

    const constantsWithVisibility = ['public', 'protected', 'private'].map((visibility) => {
        return {
            visibility: visibility,
            isStatic: true,
            type: 'const',
            name: 'TEST_' + visibility.toUpperCase(),
            value: `'${visibility}'`,
        };
    });

    expect(constants).toStrictEqual(constantsWithVisibility);
});

test('detects class is abstract', () => {
    const fileContentWithAbstractClass = `
        abstract class TestClass extends Test
        {
        
        }
    `;

    const isAbstract = fileReader.isClassAbstract(fileContentWithAbstractClass);
    expect(isAbstract).toBeTruthy();
});

test('detects class is not abstract', () => {
    const fileContentWithAbstractClass = `
        class TestClass extends Test
        {
        
        }
    `;

    const isAbstract = fileReader.isClassAbstract(fileContentWithAbstractClass);
    expect(isAbstract).toBeFalsy();
});

test('detects class name', () => {
    const fileContentWithClassName = `
        class TestClass extends Test
        {
        
        }
    `;

    const className = fileReader.extractClassNameFromFileContent(fileContentWithClassName);
    expect(className).toStrictEqual('TestClass');
});

test('extract correct UML type', () => {
    const fileContentClass = `
        class Test
        {
        
        }
    `;

    const fileContentTrait = `
        trait Test
        {
        
        }
    `;

    const fileContentInterface = `
        interface Test
        {
        
        }
    `;

    expect(fileReader.extractUmlTypeByFileContent(fileContentClass)).toStrictEqual(UmlElement.TYPE_CLASS);
    expect(fileReader.extractUmlTypeByFileContent(fileContentTrait)).toStrictEqual(UmlElement.TYPE_CLASS);
    expect(fileReader.extractUmlTypeByFileContent(fileContentInterface)).toStrictEqual(UmlElement.TYPE_INTERFACE);
});