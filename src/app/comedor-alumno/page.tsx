'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from 'lucide-react'
import { supabase } from "@/lib/supabase";

// Inicializa el cliente de Supabase
//const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

import { Grid, Card, Text } from '@nextui-org/react';

export default function App() {
  const MockItem = ({ text }) => {
    return (
      <Card css={{ h: "$24", $$cardColor: '$colors$primary' }}>
        <Card.Body>
          <Text h6 size={15} color="white" css={{ mt: 0 }}>
            {text}
          </Text>
        </Card.Body>
      </Card>
    );
  };
  return (
    <Grid.Container gap={2} justify="center">
      <Grid xs={4}>
        <MockItem text="1 of 3" />
      </Grid>
      <Grid xs={4}>
        <MockItem text="2 of 3" />
      </Grid>
      <Grid xs={4}>
        <MockItem text="3 of 3" />
      </Grid>
    </Grid.Container>
  );
}