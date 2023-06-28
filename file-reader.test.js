const fileReader = require('./file-reader');

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
    protected function getTestWithException(string $test): AbstractBlock
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
        isStaticValue: false,
        name: 'getTestWithException',
        parameters: 'string $test',
        returnType: 'AbstractBlock',
        visibility: 'protected',
    }
];

test('detects abstract functions', () => {
    const functions = fileReader.extractFunctionsFromFileContent(fileContent);
    expect(functions).toStrictEqual(expectedFunctions);
});
