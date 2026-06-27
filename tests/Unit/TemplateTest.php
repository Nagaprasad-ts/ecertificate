<?php

use App\Models\Template;

test('BASE_COLUMNS contains four required entries', function () {
    expect(Template::BASE_COLUMNS)->toHaveCount(4);

    $keys = array_column(Template::BASE_COLUMNS, 'key');
    expect($keys)->toContain('name')
        ->toContain('email')
        ->toContain('usn')
        ->toContain('phone');

    foreach (Template::BASE_COLUMNS as $col) {
        expect($col['required'])->toBeTrue();
    }
});

test('fullExpectedColumns returns BASE_COLUMNS when template has no custom columns', function () {
    $template = new Template(['expected_columns' => null]);

    expect($template->fullExpectedColumns())->toBe(Template::BASE_COLUMNS);
});

test('fullExpectedColumns appends custom columns after BASE_COLUMNS', function () {
    $custom   = [['key' => 'department', 'label' => 'Department', 'required' => false]];
    $template = new Template(['expected_columns' => $custom]);

    $all = $template->fullExpectedColumns();

    expect($all)->toHaveCount(count(Template::BASE_COLUMNS) + 1)
        ->and(array_column($all, 'key'))->toContain('department');
});

test('custom columns appear after base columns in fullExpectedColumns', function () {
    $custom   = [['key' => 'score', 'label' => 'Score', 'required' => false]];
    $template = new Template(['expected_columns' => $custom]);

    $all  = $template->fullExpectedColumns();
    $last = end($all);

    expect($last['key'])->toBe('score');
});
