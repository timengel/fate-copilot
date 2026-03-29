# App Data Schemas

- [app-data.schema.json](/Users/tengel/Dev/personal/fate-copilot/src/schemas/app-data.schema.json) is the canonical current export schema used by the app.
- [legacy/app-data.v1.0.schema.json](/Users/tengel/Dev/personal/fate-copilot/src/schemas/legacy/app-data.v1.0.schema.json) is a historical reference schema for the pre-`stressTracks` app-data format.

## Version History

### `1.1` (current)

- Replaced `stressPhysical` and `stressMental` on characters and items with `stressTracks`.
- `stressTracks` stores labeled tracks explicitly, which makes the format more flexible for future custom stress setups.
- Exported app data now uses `formatVersion: "1.1"`.

### `1.0`

- Characters and items stored stress in two fixed arrays: `stressPhysical` and `stressMental`.
- This is the pre-`stressTracks` format kept for migration reference only.

Notes:

- Only the current schema is used for runtime validation and tests.
- Legacy schemas are stored in [`schemas/legacy/`](/Users/tengel/Dev/personal/fate-copilot/src/schemas/legacy) as reference material for future migrations and debugging.
- When the export format changes again, add the old canonical schema here before updating the current one.
