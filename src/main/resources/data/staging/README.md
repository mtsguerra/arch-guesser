# Staging: catalogue awaiting migration

`buildings-v1.json` is the 50-building catalogue in the old schema (photo hints, placeholder
drawings). The app does not load it. Buildings move from here into `../buildings.json`
as they are migrated to the new schema (photo tabs with an exterior and an interior view,
text-only hints, no placeholders). Delete this folder once the migration is complete.
