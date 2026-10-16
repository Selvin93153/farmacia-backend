import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { RolesModule } from './roles/roles.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { MunicipiosModule } from './municipios/municipios.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MedicamentosModule } from './medicamentos/medicamentos.module';
import { InventariosModule } from './inventarios/inventarios.module';
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module';
import { FormasPagoModule } from './formas-pago/formas-pago.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { PlanillasModule } from './planillas/planillas.module';
import { DetallesPlanillaModule } from './detalles-planilla/detalles-planilla.module';
import { CajasModule } from './caja/cajas.module';
import { VentasModule } from './ventas/ventas.module';
import { DetallesVentaModule } from './detalles-venta/detalles-venta.module';
import { MovimientosCajaModule } from './movimientos-caja/movimientos-caja.module';
import { ActivosFijosModule } from './activos-fijos/activos-fijos.module';
import { AuditoriaEfectivoModule } from './auditoria-efectivo/auditoria-efectivo.module';
import { ClientesModule } from './cliente/clientes.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { DetallesPedidoModule } from './detalles-pedido/detalles-pedido.module';
import { EntregasModule } from './entregas/entregas.module';
import { TrasladosModule } from './traslados/traslados.module';
import { DetallesTrasladoModule } from './detalles-traslado/detalles-traslado.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),

     RolesModule,
     DepartamentosModule,
     MunicipiosModule,
     SucursalesModule,
     UsuariosModule,
     AuthModule,
     MedicamentosModule,
     InventariosModule,
     MovimientosInventarioModule,
     FormasPagoModule,
     EmpleadosModule,
     PlanillasModule,
     DetallesPlanillaModule,
     CajasModule,
     VentasModule,
     DetallesVentaModule,
     MovimientosCajaModule,
     ActivosFijosModule,
      AuditoriaEfectivoModule,
      ClientesModule,
      PedidosModule,
      DetallesPedidoModule,
      EntregasModule,
      TrasladosModule,
      DetallesTrasladoModule,
  ],
  controllers: [AppController],
})
export class AppModule {}