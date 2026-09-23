"use client";
import { Button, Icon, Input, InputGroup, InputGroupText, Stack } from "@lorenthi/ui";

export default function Demo() {
  return (
    <Stack gap="md" style={{ maxWidth: 420 }}>
      <InputGroup block>
        <InputGroupText>https://</InputGroupText>
        <Input placeholder="praktijk" />
        <InputGroupText>.lorenthi.be</InputGroupText>
      </InputGroup>

      <InputGroup block>
        <Input placeholder="Zoek een dossier…" prefix={<Icon name="search" />} />
        <Button>Zoeken</Button>
      </InputGroup>

      <InputGroup block>
        <InputGroupText>€</InputGroupText>
        <Input placeholder="0,00" inputMode="decimal" />
        <Button variant="secondary" icon={<Icon name="check" />} aria-label="Bevestigen" />
      </InputGroup>
    </Stack>
  );
}
